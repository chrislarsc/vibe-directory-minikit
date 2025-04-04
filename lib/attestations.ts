import { encodeAbiParameters, type Address } from 'viem';
import { VIEW_ATTESTATION_SCHEMA_UID, BASE_CHAIN_ID } from './constants';

// In-memory storage for attestations (in a real app, we would query a blockchain)
interface Attestation {
  id: string;
  schema: string;
  attester: Address;
  recipient: Address;
  projectId: string;
  timestamp: number;
}

const attestations: Attestation[] = [];

/**
 * Create an attestation for a project view
 */
export async function createAttestationForProjectView(
  userAddress: Address, 
  projectId: string
): Promise<Attestation> {
  // Encode data for attestation
  const encodedData = encodeAbiParameters(
    [{ type: 'string' }, { type: 'string' }],
    [userAddress, projectId]
  );
  
  // Create an attestation (in a real app, this would call an attestation service)
  const attestation: Attestation = {
    id: `${userAddress}-${projectId}-${Date.now()}`,
    schema: VIEW_ATTESTATION_SCHEMA_UID,
    attester: userAddress,
    recipient: userAddress, // Self-attestation
    projectId,
    timestamp: Date.now(),
  };
  
  // Store attestation
  attestations.push(attestation);
  
  console.log(`Attestation created: User ${userAddress} viewed project ${projectId}`);
  
  return attestation;
}

/**
 * Get all attestations by a user
 */
export async function getUserAttestations(userAddress: Address): Promise<Attestation[]> {
  return attestations.filter(a => a.attester.toLowerCase() === userAddress.toLowerCase());
}

/**
 * Get all attestations for a project
 */
export async function getProjectAttestations(projectId: string): Promise<Attestation[]> {
  return attestations.filter(a => a.projectId === projectId);
}

/**
 * Get attestation count for a user
 */
export async function getUserAttestationCount(userAddress: Address): Promise<number> {
  return (await getUserAttestations(userAddress)).length;
}

/**
 * Get attestation count for a project
 */
export async function getProjectAttestationCount(projectId: string): Promise<number> {
  return (await getProjectAttestations(projectId)).length;
}

/**
 * Get unique projects viewed by a user
 */
export async function getUniqueProjectsViewedByUser(userAddress: Address): Promise<string[]> {
  const userAttestations = await getUserAttestations(userAddress);
  const projectIds = new Set(userAttestations.map(a => a.projectId));
  return Array.from(projectIds);
}

/**
 * Check if a user has viewed a project
 */
export async function hasUserViewedProject(userAddress: Address, projectId: string): Promise<boolean> {
  const userAttestations = await getUserAttestations(userAddress);
  return userAttestations.some(a => a.projectId === projectId);
} 