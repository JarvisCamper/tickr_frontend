// app/reports/page.tsx
import { Metadata } from 'next'; // Optional: for page metadata
import ReportClientWrapper from './components/ReportClientWrapper';

export default function ReportsPage() {
  return <ReportClientWrapper />;
}

export const metadata: Metadata = {
  title: 'Reports',
};