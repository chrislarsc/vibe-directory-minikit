import type { Address } from 'viem';

interface Attestation {
  id: string;
  schema: string;
  attester: Address;
  recipient: Address;
  projectId: string;
  timestamp: number;
}

interface UserAttestationData {
  attestations: Attestation[];
  attestationCount: number;
  uniqueProjectsCount: number;
  uniqueProjectIds: string[];
}

/**
 * Create an attestation for a project view
 */
export async function createAttestationForProjectView(userAddress: Address, projectId: string): Promise<Attestation> {
  const response = await fetch('/api/attestations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userAddress, projectId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create attestation');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Get attestation data for a user
 */
export async function getUserAttestationData(userAddress: Address): Promise<UserAttestationData> {
  const response = await fetch(`/api/attestations/user/${userAddress}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get attestation data');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Check if a user has viewed a project
 */
export async function hasUserViewedProject(userAddress: Address, projectId: string): Promise<boolean> {
  try {
    const userData = await getUserAttestationData(userAddress);
    return userData.uniqueProjectIds.includes(projectId);
  } catch (error) {
    console.error('Error checking if user viewed project:', error);
    return false;
  }
} 