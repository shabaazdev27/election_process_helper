/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssistantPage from '../page';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ csrfToken: 'test-token' }),
    text: () => Promise.resolve(''),
    body: new ReadableStream(),
  } as Response)
);

describe('Assistant Page (Chat Interface)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the assistant page with header', () => {
      render(<AssistantPage />);
      
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      expect(screen.getByText('Online & Ready')).toBeInTheDocument();
    });

    it('should display initial greeting message', () => {
      render(<AssistantPage />);
      
      expect(screen.getByText(/Hello! I'm ElectionGuide/i)).toBeInTheDocument();
    });

    it('should have a chat input field', () => {
      render(<AssistantPage />);
      
      const input = screen.getByTestId('chat-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Ask anything about the election process...');
    });

    it('should have a send button', () => {
      render(<AssistantPage />);
      
      const sendButton = screen.getByTestId('chat-send-button');
      expect(sendButton).toBeInTheDocument();
      expect(sendButton).toHaveAttribute('aria-label', 'Send Message');
    });

    it('should display suggested question hint', () => {
      render(<AssistantPage />);
      
      expect(screen.getByText(/Suggested:/i)).toBeInTheDocument();
      expect(screen.getByText(/How do I register to vote?/i)).toBeInTheDocument();
    });

    it('should have a reset button', () => {
      render(<AssistantPage />);
      
      const resetButton = screen.getByRole('button', { name: /Reset Conversation/i });
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should display message container', () => {
      render(<AssistantPage />);
      
      const container = screen.getByTestId('message-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('data-message-count', '1'); // Initial message
    });

    it('should have accessibility attributes for messages', () => {
      render(<AssistantPage />);
      
      const messages = screen.getAllByTestId('chat-message');
      expect(messages.length).toBeGreaterThanOrEqual(1);
      expect(messages[0]).toHaveAttribute('role', 'article');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AssistantPage />);
      
      expect(screen.getByLabelText('Chat input')).toBeInTheDocument();
      expect(screen.getByLabelText('Send Message')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset Conversation')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<AssistantPage />);
      
      // The assistant should have visible heading
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });

  describe('Footer Info', () => {
    it('should display disclaimer text', () => {
      render(<AssistantPage />);
      
      expect(
        screen.getByText(/AI responses are generated based on official government records/i)
      ).toBeInTheDocument();
    });

    it('should have help center link', () => {
      render(<AssistantPage />);
      
      const helpLink = screen.getByRole('link', { name: /Help Center/i });
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute('href', 'mailto:khanshabaaz05@gmail.com');
    });
  });
});

