import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from '../api/api.js'
import toast from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import debounce from 'lodash.debounce'


const AppContext = createContext(undefined)

export function AppContextProvider({ children }) {

    const navigate = useNavigate()

    // Auth State
    const [user, setUser] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)

    // States
    const [projects, setProjects] = useState([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [activeProject, setActiveProject] = useState(null)
    const [loadingActiveProject, setLoadingActiveProject] = useState(true)
    const [chatLoading, setChatLoading] = useState(false)
    const [generatingProject, setGeneratingProject] = useState(false)
    const [activeFile, setActiveFile] = useState('/App.js')
    const [showCode, setShowCode] = useState(false)


    // Auth Actions
    const checkSession = useCallback(async () => {
        try {
            const { data } = await api.get('/api/auth/me')
            setUser(data.user)
        } catch (error) {
            setUser(null)
        } finally {
            setLoadingUser(false)
        }
    }, [])

    useEffect(() => {
        checkSession()
    }, [])

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password })
            setUser(data.user)
            toast.success('Welcome Back!')
            navigate('/')
        } catch (error) {
            console.log('Login Failed', error)
            const errMsg = error?.response?.data?.error || "Invalid email or password"
            toast.error(errMsg)
            throw new Error(errMsg)
        }
    }

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password })
            setUser(data.user)
            toast.success('Account created successfully!')
            navigate('/')
        } catch (error) {
            console.log('Registration Failed', error)
            const errMsg = error?.response?.data?.error || "Registration Failed"
            toast.error(errMsg)
            throw new Error(errMsg)
        }
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
            setUser(null)
            setProjects([])
            setActiveProject(null)
            toast.success("Logged out successfully")
            navigate('/login')
        } catch (error) {
            console.log('Logout failed:', error)
            toast.error('Logout failed')
        }
    }


    // Projects Actions
    const loadProjects = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/api/projects')
            setProjects(data)
        } catch (error) {
            console.error('Failed to list projects', error)
            toast.error('Failed to load project list')
        } finally {
            setLoadingProjects(false)
        }
    }, [user])

    const loadProject = useCallback(async (id, silent = false) => {
        if (!user) return;
        if (!silent) setLoadingActiveProject(true)

        try {
            const { data } = await api.get(`/api/projects/${id}`)
            setActiveProject(data)

            // Default file selection
            const files = Object.keys(data.files || {})
            if (files.length > 0) {
                setActiveFile((prev) => {
                    if (files.includes(prev)) return prev;
                    if (files.includes('/App.js')) return '/App.js'
                    return files[0]
                })
            }
        } catch (error) {
            console.error('Failed to load project', error)
            if (!silent) {
                toast.error('Failed to load project details')
                navigate('/')
            }
        } finally {
            if (!silent) setLoadingActiveProject(false)
        }
    }, [user, navigate])


    // Automatically poll active project status if generating / pending / revising
    useEffect(() => {
        if (!activeProject?._id || !user) return;

        const isOngoing =
            activeProject.status === 'generating' ||
            activeProject.status === 'pending' ||
            activeProject.status === 'revising'

        if (isOngoing) {
            setChatLoading(true)
            const interval = setInterval(() => {
                loadProject(activeProject._id, true)
            }, 2000)
            return () => clearInterval(interval)
        } else {
            setChatLoading(false)
        }
    }, [activeProject?._id, activeProject?.status, loadProject, user])


    const handleGenerate = useCallback(
        async (prompt) => {
            if (!user) return;
            setGeneratingProject(true)

            try {
                const { data } = await api.post('/api/projects', { prompt })
                toast.success('AI agent is planning structure...')
                navigate(`/builder/${data._id}`)
            } catch (error) {
                console.error('Failed to generate project', error)
                toast.error(error?.response?.data?.error || 'Failed to generate project')
            } finally {
                setGeneratingProject(false)
            }
        }, [navigate, user]
    )

    const handleDelete = useCallback(
        async (id) => {
            if (!user) return;

            try {
                await api.delete(`/api/projects/${id}`)
                setProjects((prev) => prev.filter((p) => p._id !== id))
                toast.success('Project deleted successfully')
            } catch (error) {
                console.error('Failed to delete project', error)
                toast.error('Failed to delete project')
            }
        }, [user]
    )

    const handleChat = useCallback(
        async (message) => {
            if (!user || !activeProject) return;
            setChatLoading(true)

            try {
                const { data } = await api.post(`/api/projects/${activeProject._id}/chat`, { message })
                setActiveProject(data)
                if (data.errors && data.errors.length > 0) {
                    toast.error(`${data.errors.length} revision pathc(es) failed`)
                } else {
                    toast.success(`Updatesd to version ${data.version} successfully`)
                }
            } catch (error) {
                console.error('Revision request failed', error)
                toast.error(error?.response?.data?.error || 'Revision request failed')
            } finally {
                setChatLoading(false)
            }
        }, [user, activeProject]
    )

    const deboucedSave = useMemo(()=>
        debounce(async (id, files) => {
            try {
                await api.put(`/api/projects/${id}/files`, { files })
                toast.success('Changes saved')
            } catch (error) {
                console.error('Failed to auto-save files', error)
                toast.error('Failed to save code modifications')
            }
        }, 1000), []
    )

    useEffect(() => {
        return ()=> {deboucedSave.cancel()}
    }, [deboucedSave])

    const updateProjectFiles = useCallback(
        async (files) => {
          if (!user || !activeProject) return;
          deboucedSave(activeProject._id, files)

        },[activeProject, user, deboucedSave]
    )


    return (
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register,
            logout,
            projects,
            loadingProjects,
            loadingActiveProject,
            activeProject,
            chatLoading,
            generatingProject,
            activeFile,
            showCode,
            setActiveFile,
            setShowCode,
            loadProject,
            loadProjects,
            handleGenerate,
            handleDelete, 
            updateProjectFiles,
            handleChat
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider')
    }
    return context;
}