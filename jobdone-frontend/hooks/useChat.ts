import { useRouter } from 'next/navigation';

export const useChat = () => {
    const router = useRouter();

    const startChat = async (receiverId: string) => {
        if (!receiverId) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to send a message.");
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId })
            });

            const data = await res.json();
            if (data.success && data.data._id) {
                router.push(`/chat/${data.data._id}`);
            } else {
                console.error("Failed to start chat:", data);
                alert("Could not start conversation. Please try again.");
            }
        } catch (err) {
            console.error("Error starting chat:", err);
            alert("Network error while trying to start conversation.");
        }
    };

    return { startChat };
};
