import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notification from '../Notification';

test('affiche le message et gère la fermeture', () => {
  const onClose = jest.fn();
  render(<Notification message="Hello" onClose={onClose} />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(onClose).toHaveBeenCalled();
});


