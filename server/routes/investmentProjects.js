import express from 'express';
import InvestmentProject from '../models/InvestmentProject.js';

const router = express.Router();

// Get all active investment projects
router.get('/', async (req, res) => {
  try {
    const projects = await InvestmentProject.find({ status: { $in: ['active', 'funded'] } })
      .sort({ createdAt: -1 })
      .populate('startupId')
      .populate('entrepreneurId');
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching investment projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get investment project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await InvestmentProject.findById(req.params.id)
      .populate('startupId')
      .populate('entrepreneurId');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get investment projects by entrepreneur ID
router.get('/entrepreneur/:entrepreneurId', async (req, res) => {
  try {
    const projects = await InvestmentProject.find({ entrepreneurId: req.params.entrepreneurId })
      .sort({ createdAt: -1 })
      .populate('startupId');
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching entrepreneur projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get investment projects by user ID (alias for entrepreneur route)
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await InvestmentProject.find({ 
      $or: [
        { entrepreneurId: req.params.userId },
        { userId: req.params.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('startupId');
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new investment project
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.startupId || !projectData.entrepreneurId || !projectData.projectName || 
        !projectData.fundingGoal || !projectData.minimumInvestment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = new InvestmentProject(projectData);
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating investment project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update investment project
router.put('/:id', async (req, res) => {
  try {
    const project = await InvestmentProject.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Invest in a project
router.post('/:id/invest', async (req, res) => {
  try {
    const { investorId, investorName, investorEmail, amount } = req.body;
    
    if (!investorId || !amount) {
      return res.status(400).json({ message: 'Investor ID and amount are required' });
    }

    const project = await InvestmentProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is still accepting investments
    if (project.status !== 'active') {
      return res.status(400).json({ message: 'Project is not accepting investments' });
    }

    // Check if funding deadline has passed
    if (new Date() > new Date(project.fundingDeadline)) {
      return res.status(400).json({ message: 'Funding deadline has passed' });
    }

    // Check minimum investment
    if (amount < project.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ₹${project.minimumInvestment}` 
      });
    }

    // Check maximum investment if specified
    if (project.maximumInvestment && amount > project.maximumInvestment) {
      return res.status(400).json({ 
        message: `Maximum investment is ₹${project.maximumInvestment}` 
      });
    }

    // Check if investment would exceed funding goal
    const remainingFunding = project.fundingGoal - project.currentFunding;
    if (amount > remainingFunding) {
      return res.status(400).json({ 
        message: `Only ₹${remainingFunding} remaining to reach funding goal. Please invest up to this amount.`,
        remainingFunding 
      });
    }

    // Calculate equity percentage for this investment
    const equityPercentage = (amount / project.fundingGoal) * project.equityOffered;

    // Add investor
    project.investors.push({
      investorId,
      investorName,
      investorEmail,
      amount,
      equityPercentage,
      status: 'confirmed'
    });

    // Update current funding
    project.currentFunding += amount;

    await project.save();
    
    res.json({ 
      message: 'Investment successful',
      project,
      investment: {
        amount,
        equityPercentage,
        remainingFunding: project.fundingGoal - project.currentFunding,
        fundingPercentage: project.fundingPercentage
      }
    });
  } catch (error) {
    console.error('Error investing in project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get investment details for a specific investor
router.get('/:id/investor/:investorId', async (req, res) => {
  try {
    const project = await InvestmentProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const investments = project.investors.filter(
      inv => inv.investorId.toString() === req.params.investorId
    );

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEquity = investments.reduce((sum, inv) => sum + inv.equityPercentage, 0);

    res.json({
      projectName: project.projectName,
      investments,
      totalInvested,
      totalEquity,
      projectStatus: project.status,
      fundingProgress: project.fundingPercentage
    });
  } catch (error) {
    console.error('Error fetching investor details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all investments by an investor
router.get('/investor/:investorId/all', async (req, res) => {
  try {
    const projects = await InvestmentProject.find({
      'investors.investorId': req.params.investorId
    }).populate('startupId');

    const investments = projects.map(project => {
      const investorInvestments = project.investors.filter(
        inv => inv.investorId.toString() === req.params.investorId
      );

      const totalInvested = investorInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalEquity = investorInvestments.reduce((sum, inv) => sum + inv.equityPercentage, 0);

      return {
        projectId: project._id,
        projectName: project.projectName,
        startupId: project.startupId,
        totalInvested,
        totalEquity,
        projectStatus: project.status,
        fundingProgress: project.fundingPercentage,
        investmentDate: investorInvestments[0]?.investmentDate
      };
    });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching investor investments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete investment project
router.delete('/:id', async (req, res) => {
  try {
    const project = await InvestmentProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Don't allow deletion if there are investments
    if (project.investors.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete project with existing investments. Please cancel the project instead.' 
      });
    }

    await InvestmentProject.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel investment project
router.put('/:id/cancel', async (req, res) => {
  try {
    const project = await InvestmentProject.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project cancelled successfully', project });
  } catch (error) {
    console.error('Error cancelling project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
