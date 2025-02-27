import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  // Silence future flag warnings by using latest API patterns and opting into all future flags
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper to render with routes
export const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/', paths = ['*'] } = {}
) => {
  const router = createMemoryRouter(
    [{ path: paths[0], element: ui }],
    { initialEntries: [route] }
  );
  
  return rtlRender(<RouterProvider router={router} />);
};
