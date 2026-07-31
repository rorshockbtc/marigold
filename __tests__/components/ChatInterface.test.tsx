import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '../../src/components/ChatInterface';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: () => '/insights'
}));

jest.mock('../../src/hooks/useDataStoryFS', () => ({
  useDataStoryFS: () => ({
    saveDataStory: jest.fn().mockResolvedValue('story.json'),
    isSaving: false,
    error: null
  })
}));

describe('ChatInterface', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('renders the J.A.R.V.I.S Data Investigator empty state', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/I am Mari, your Data Investigator/i)).toBeInTheDocument();
    expect(screen.getByText(/For your security, I cannot see your raw files/i)).toBeInTheDocument();
  });

  it('allows user to type in the textarea', () => {
    render(<ChatInterface />);
    const textarea = screen.getByPlaceholderText(/Type a question/i);
    fireEvent.change(textarea, { target: { value: 'What are the top anomalies?' } });
    expect(textarea).toHaveValue('What are the top anomalies?');
  });
});
