import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM renderizado após cada teste
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// jsdom não implementa alert/confirm — stubamos para os componentes não quebrarem
vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true));
