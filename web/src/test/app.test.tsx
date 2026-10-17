import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../app/App';

describe('CampusBite Stage 3 Application Shell & Ordering Flow', () => {
  it('renders brand header, navigation, and student dining portal', async () => {
    render(<App />);

    expect(screen.getByText('CampusBite')).toBeInTheDocument();
    expect(screen.getByText(/Authoritative Kitchen Synchronization/i)).toBeInTheDocument();
    expect(screen.getByText(/BREAK-FIT™ Smart Academic Timing/i)).toBeInTheDocument();
  });

  it('allows toggling between Student Canteen and Kitchen Operations', async () => {
    render(<App />);

    const toggleButton = screen.getByRole('button', { name: /Switch to Kitchen Operations/i });
    expect(toggleButton).toBeInTheDocument();

    // Switch to Kitchen
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Kitchen Operations & Live Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Physical Raw Stock Ledger/i)).toBeInTheDocument();

    // Switch back
    const studentToggle = screen.getByRole('button', { name: /Switch to Student Portal/i });
    fireEvent.click(studentToggle);
    expect(screen.getByText(/Authoritative Kitchen Synchronization/i)).toBeInTheDocument();
  });

  it('filters dishes when a BREAK-FIT timing option is selected', async () => {
    render(<App />);

    const fiveMinOption = screen.getByRole('radio', { name: /⚡ 5-min Recess/i });
    fireEvent.click(fiveMinOption);

    // Dishes ready in warmer (Samosas, Gulab Jamun) should be present
    expect(screen.getByText(/Samosa \(2 pcs\)/i)).toBeInTheDocument();
  });

  it('adds an item to tray and opens the checkout verification modal', async () => {
    render(<App />);

    const addButtons = screen.getAllByRole('button', { name: /\+ Add to Tray/i });
    fireEvent.click(addButtons[0]);

    // View Tray button should appear
    const viewTrayBtn = await screen.findByRole('button', { name: /View tray with 1 items/i });
    expect(viewTrayBtn).toBeInTheDocument();

    // Open Checkout
    fireEvent.click(viewTrayBtn);
    expect(screen.getByText(/Order Review & Confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(/Authoritative Total:/i)).toBeInTheDocument();
  });
});
