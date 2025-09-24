/**
 * Test Helpers
 * Non-component testing utilities
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AllProviders } from './test-utils';

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export specific testing utilities
export {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  getByText,
  getByRole,
  getByTestId,
  queryByText,
  queryByRole,
  queryByTestId,
  findByText,
  findByRole,
  findByTestId,
  fireEvent,
  act
} from '@testing-library/react';

// Export custom render function
export { customRender as render };
