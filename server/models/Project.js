import mongoose, { Schema } from "mongoose";
import bcrypt, { compare } from 'bcrypt'

const MessageSchema = new Schema({
   role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
   },
   timestamp: {
    type: Date, default: Date.now
   },
}, {_id: false})

const PlannedFileSchema = new Schema({
    path: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
  
}, {_id: false})

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: 'Untitled Project'
    },
    description: {
        type: String,
        default: ''
    },
    files: {
        type: Schema.Types.Mixed,
        default: {}
    },
    messages: {
        type: [MessageSchema],
        default: []
    },
    version: {
        type: Number, 
        default: 0
    },
    owner: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'generating', 'revising', 'completed', 'failed'],
        default: 'pending'
    },
    filesPlanned: {
        type: [PlannedFileSchema],
        default: []
    },
    filesGenerated: {
        type: [String],
        default: []
    },
    currentFile: {
        type: String, 
        default: null
    },
    error: {
        type: String,
        default: null
    }
}, {timestamps: true})

// Hash Passwrod before Saving
ProjectSchema.pre('save', async function(){
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
ProjectSchema.methods.comparePassword = async function name(password) {
    return bcrypt.compare(password, this.password)
    
}

export const Project = mongoose.model('Project', ProjectSchema)