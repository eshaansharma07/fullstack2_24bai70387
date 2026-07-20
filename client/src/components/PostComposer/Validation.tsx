import { CheckCircle, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import type { PlatformId, ValidationData } from '../../types';

interface ValidationProps {
  validationData: ValidationData;
  selectedPlatforms: PlatformId[];
}

export default function Validation({ validationData, selectedPlatforms }: ValidationProps) {
  if (selectedPlatforms.length === 0) {
    return (
      <div className="validation-card">
        <div className="validation-header">
          <ShieldAlert size={16} /> Constraint Status
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          Please select at least one social media platform to view validations.
        </p>
      </div>
    );
  }

  // Get active platform names
  const platformNames: Record<PlatformId, string> = {
    twitter: 'X (Twitter)',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  };

  return (
    <div className="validation-card">
      <div className="validation-header">
        <ShieldAlert size={16} /> Platform Constraint Checks
      </div>
      <div className="validation-list">
        {selectedPlatforms.map((platform) => {
          const status = validationData[platform] || { isValid: true, errors: [], warnings: [] };
          const name = platformNames[platform];

          return (
            <div key={platform} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: status.isValid ? 'var(--text-main)' : 'var(--error)' }}>
                  {name}
                </span>
                <span style={{ fontSize: '0.75rem', color: status.isValid ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                  {status.isValid ? 'Valid' : 'Errors Found'}
                </span>
              </div>

              {/* Errors List */}
              {status.errors.map((err, idx) => (
                <div key={`err-${idx}`} className="validation-item error">
                  <XCircle size={14} className="validation-item-icon" />
                  <span>{err}</span>
                </div>
              ))}

              {/* Warnings List */}
              {status.warnings.map((warn, idx) => (
                <div key={`warn-${idx}`} className="validation-item warning">
                  <AlertTriangle size={14} className="validation-item-icon" />
                  <span>{warn}</span>
                </div>
              ))}

              {/* Valid Feedback */}
              {status.isValid && status.errors.length === 0 && (
                <div className="validation-item valid">
                  <CheckCircle size={14} className="validation-item-icon" />
                  <span>All limits and posting criteria met.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
