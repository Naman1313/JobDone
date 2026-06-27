// User Types
export interface IUser {
    _id: string;
    phone: string;
    role: 'worker' | 'client';
    name: string;
    profilePhoto?: string;
    isVerified: boolean;
    trustScore: number;
    createdAt: string;
}

export interface IWorkerProfile extends IUser {
    trade: string;
    yearsExp: number;
    hourlyRate: number;
    languages: string[];
    availability: 'available' | 'busy' | 'offline';
    serviceRadius: number;
    aadhaarStatus: 'pending' | 'verified' | 'rejected';
    skills: string[];
    certifications: string[];
}

// Job Types
export interface IJob {
    _id: string;
    clientId: string | IUser;
    title: string;
    description: string;
    trade: string;
    budget: number;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    status: 'open' | 'filled' | 'closed' | 'completed';
    expiresAt: string;
    distance?: number;
    createdAt: string;
}

// Post Types
export interface IPost {
    _id: string;
    authorId: string | IWorkerProfile;
    content: string;
    mediaUrls: string[];
    trade: string;
    hashtags: string[];
    likes: string[];
    saves: string[];
    isPublic: boolean;
    createdAt: string;
}
