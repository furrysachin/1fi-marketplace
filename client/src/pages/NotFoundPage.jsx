import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page not found · 1Fi Marketplace');
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      subtitle="The page you're looking for doesn't exist or may have been moved."
      action={
        <Link to="/shop/marketplace" className="btn-primary mt-2">
          Go to 1Fi Marketplace
        </Link>
      }
    />
  );
}