import { Router } from 'express'
import { createProjects, deleteProjects, getProjects, getPublicProject, listProjects, publishProject, updateProjectFiles } from '../controllers/projectController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { chat } from '../controllers/chatController.js'


const projectRouter = Router()

//Public Route
projectRouter.get('public/:id', getPublicProject)

//Protect all following routes 
projectRouter.use(authMiddleware)

projectRouter.post('/', createProjects)
projectRouter.get('/', listProjects)
projectRouter.get('/:id', getProjects)
projectRouter.delete('/:id', deleteProjects)
projectRouter.put('/:id/files', updateProjectFiles)
projectRouter.post('/:id/publish', publishProject)

//Chat 
projectRouter.post('/:id/chat', chat)

export default projectRouter;
