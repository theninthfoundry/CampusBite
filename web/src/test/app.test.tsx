import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../app/App';

describe('CampusBite Stage 1 Application Shell', () => {
  it('renders brand header, navigation, and student portal by default', () => {
    render(<App />);

    // Brand and subtitle
    expect(screen.getByText('CampusBite')).toBeInTheDocument();
    expect(screen.getByText(/Smart Campus Dining/i)).toBeInTheDocument();

    // Verification of fixtures warning / tag
    expect(screen.getByText(/\[Development Fixture Data — Stage 1 Foundation\]/i)).toBeInTheDocument();

    // Menu items present
    expect(screen.getByText(/Steamed Idli Sambar/i)).toBeInTheDocument();
  });

  it('allows toggling between Student and Kitchen portals', () => {
    render(<App />);

    // Initially in Student portal
    const toggleButton = screen.getByRole('button', { name: /Switch to Kitchen Operations/i });
    expect(toggleButton).toBeInTheDocument();

    // Switch to Kitchen
    fireEvent.click(toggleButton);

    // Kitchen board should now be displayed
    expect(screen.getByText(/Kitchen Operations Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Incoming Orders/i)).toBeInTheDocument();

    // Switch back
    const studentToggleButton = screen.getByRole('button', { name: /Switch to Student Portal/i });
    fireEvent.click(studentToggleButton);
    expect(screen.getByText(/Smart Campus Dining/i)).toBeInTheDocument();
  });

  it('filters items when BREAK-FIT option is selected', () => {
    render(<App />);

    // Select 5-min break
    const fiveMinOption = screen.getByRole('radio', { name: /⚡ 5-min Quick Bite/i });
    fireEvent.click(fiveMinOption);

    // 4 min item (Steamed Idli) should be visible
    expect(screen.getByText(/Steamed Idli Sambar/i)).toBeInTheDocument();
    // 15 min item (Chicken Biryani) should be filtered out
    expect(screen.queryByText(/Hyderabadi Chicken Biryani/i)).not.toBeInTheDocument();
  });

  it('supports adding item to cart and displays notification', () => {
    render(<App />);

    const addButtons = screen.getAllByRole('button', { name: /\+ Add to Cart/i });
    fireEvent.click(addButtons[0]);

    // Cart pill should update
    expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
  });
});
