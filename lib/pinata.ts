export const uploadToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log('Starting Pinata upload...');
        console.log('JWT Token:', process.env.NEXT_PUBLIC_PINATA_JWT ? 'Present' : 'Missing');
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            },
            body: formData
        });

        console.log('Pinata response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Pinata error details:', errorData);
            throw new Error(`Failed to upload to Pinata: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Pinata upload successful:', data);
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
};

export const removeFromPinata = async (ipfsHash: string): Promise<void> => {
    try {
        console.log('Starting Pinata unpin...');
        console.log('IPFS Hash:', ipfsHash);
        
        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            }
        });

        console.log('Pinata unpin response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Pinata unpin error details:', errorData);
            throw new Error(`Failed to remove from Pinata: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error removing from Pinata:', error);
        throw error;
    }
}; 