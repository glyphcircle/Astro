import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';

interface PlaceholderProps {
  featureName: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ featureName }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <Card>
        <div className="p-8">
          <h2 className="text-4xl font-bold text-amber-300 mb-4">{featureName}</h2>
          <p className="text-lg text-amber-100 mb-2">
            {t('featureComingSoon', { featureName })}
          </p>
          <p className="text-amber-100 mb-8">{t('stayTuned')}</p>
          <Link to="/home">
            <Button>
                {t('goBackHome')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Placeholder;