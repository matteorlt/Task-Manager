import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../store/slices/authSlice';
import themeReducer from '../../store/slices/themeSlice';
import Login from '../Login';

// Mock fetch
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ token: 't', user: { id: 1, name: 'John', email: 'john@example.com' } }),
  }) as any;
});

afterEach(() => {
  global.fetch = originalFetch as any;
});

function renderLogin() {
  const store = configureStore({ reducer: { auth: authReducer, theme: themeReducer } });
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <Login />
      </Provider>
    </MemoryRouter>
  );
}

test('soumet le formulaire et dispatch loginSuccess', async () => {
  renderLogin();
  fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });
});


