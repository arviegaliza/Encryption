import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main heading', () => {
  render(<App />);
  const heading = screen.getByText(/Secure QR File Share/i);
  expect(heading).toBeInTheDocument();
});
