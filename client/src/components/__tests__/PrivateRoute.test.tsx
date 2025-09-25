import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';

function renderWithStore(ui: React.ReactElement, preloadedState: any) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('PrivateRoute', () => {
  test('redirige vers /login si non authentifié', () => {
    const { container } = renderWithStore(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PrivateRoute><div>Home</div></PrivateRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
      { auth: { token: null, loading: false, error: null, user: null } }
    );
    expect(container.textContent).toContain('Login Page');
  });

  test('rend le contenu si authentifié', () => {
    const { container } = renderWithStore(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PrivateRoute><div>Secret</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>,
      { auth: { token: 'token', loading: false, error: null, user: { id: 1, email: 'john@example.com', name: 'John' } } }
    );
    expect(container.textContent).toContain('Secret');
  });
});


