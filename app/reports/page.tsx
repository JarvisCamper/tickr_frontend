import { Metadata } from 'next'; // Optional: for page metadata
import ReportClientWrapper from './ReportClientWrapper';

export default function ReportsPage() {
  return <ReportClientWrapper />;
}

export const metadata: Metadata = {
  title: 'Reports',
};
