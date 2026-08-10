import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import type { PlatformId } from '../../types';

interface PlatformTabProps {
  selectedPlatforms: PlatformId[];
  togglePlatform: (platformId: PlatformId) => void;
}

interface PlatformOption {
  id: PlatformId;
  name: string;
  icon: LucideIcon;
}

const platforms: PlatformOption[] = [
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
];

function PlatformTab({ selectedPlatforms, togglePlatform }: PlatformTabProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        <span className="section-badge-tag">🎯 CHANNELS</span> Target Social Platforms
      </label>
      <div className="platform-selector">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              className={`platform-pill ${isSelected ? 'selected' : ''}`}
              data-platform={platform.id}
              onClick={() => togglePlatform(platform.id)}
            >
              <Icon size={16} />
              {platform.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PlatformTab);
