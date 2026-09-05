import { useLocation } from 'react-router-dom';
import { Award, MapPin } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const config = {
  '/shop/top-brands': {
    icon: Award,
    title: 'Top Brands',
    subtitle:
      'Explore curated collections from the brands you love. This section is coming soon — head over to 1Fi Marketplace in the meantime.',
  },
  '/shop/nearby-stores': {
    icon: MapPin,
    title: 'Nearby Stores',
    subtitle:
      'Find partner stores near you that accept 1Fi EMI. This section is coming soon — head over to 1Fi Marketplace in the meantime.',
  },
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const { icon, title, subtitle } = config[pathname] ?? config['/shop/top-brands'];
  usePageTitle(`${title} — 1Fi Shop`);

  return <EmptyState icon={icon} title={title} subtitle={subtitle} />;
}