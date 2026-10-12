import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { AlertCircleIcon } from 'lucide-react'
import FullPagePreview from '../components/FullPagePreview.jsx'
import api from '../api/api.js'
import { useAppContext } from '../context/AppContext.jsx'

const PreviewPage = () => {
  const {id} = useParams()
  const {activeProject : project, loadingActiveProject: loading, loadProject} = useAppContext()

  useEffect(()=> {
      if (id) loadProject(id);


  }, [id, loadProject])

  if (loading || !project) return <Loading />
  
  return (
   <FullPagePreview files={project.files}/>
  )
}

export default PreviewPage
