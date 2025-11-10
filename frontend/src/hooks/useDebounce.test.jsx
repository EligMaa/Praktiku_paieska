import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import useDebounce from './useDebounce';
import { test, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

function TestComponent({delay=200}){
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, delay);
  return (
    <div>
      <input aria-label="input" value={value} onChange={e => setValue(e.target.value)} />
      <div data-testid="debounced">{debounced}</div>
    </div>
  );
}

test('useDebounce updates value only after delay', async () => {
  vi.useFakeTimers();
  act(() => {
    render(<TestComponent delay={200} />);
  });

  const input = screen.getByLabelText('input');
  const out = screen.getByTestId('debounced');

  // initially empty
  expect(out.textContent).toBe('');

  // change input
  act(() => {
    fireEvent.change(input, { target: { value: 'a' } });
  });
  // immediate value should still be empty (debounced)
  expect(out.textContent).toBe('');

  // advance just before timeout
  act(() => {
    vi.advanceTimersByTime(199);
  });
  // flush microtasks
  await act(async () => { await Promise.resolve(); });
  expect(out.textContent).toBe('');

  // advance to timeout
  await act(async () => {
    vi.advanceTimersByTime(1);
    await Promise.resolve();
  });
  expect(out.textContent).toBe('a');

  vi.useRealTimers();
});
