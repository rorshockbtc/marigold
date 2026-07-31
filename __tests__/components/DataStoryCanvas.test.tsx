import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DataStoryCanvas } from '@/components/DataStoryCanvas';
import { DataStory } from '@/hooks/useDataConcierge';

describe('DataStoryCanvas UI Component', () => {
  const mockStory: DataStory = {
    id: 'test-story-1',
    title: 'Ambient Temperature vs. Obesity Prevalence',
    query: 'Does average temperature correlate with obesity?',
    summary: 'Analysis of CDC & NOAA public climate datasets indicates a positive correlation.',
    correlationScore: 0.76,
    sourceUrl: 'https://data.cdc.gov/api/views/climate/rows.csv',
    sourceName: 'CDC & NOAA Open Data Portal',
    createdAt: '2026-07-30T10:00:00Z',
    isSavedLocally: false,
    dataPoints: [
      { label: 'Zone 1', valueA: 52, valueB: 22.4 },
      { label: 'Zone 2', valueA: 84, valueB: 38.4 },
    ],
    insights: [
      'Extreme heat days reduce outdoor activity frequency.',
      'Public health resources should target shaded infrastructure.'
    ]
  };

  it('renders story title, correlation score, data points, and insights', () => {
    render(
      <DataStoryCanvas
        story={mockStory}
        onPublishToGroup={vi.fn()}
        onSaveLocally={vi.fn()}
      />
    );

    expect(screen.getByText('Ambient Temperature vs. Obesity Prevalence')).toBeDefined();
    expect(screen.getByText('+0.76')).toBeDefined();
    expect(screen.getByText('Zone 1')).toBeDefined();
    expect(screen.getByText(/Extreme heat days reduce outdoor activity/i)).toBeDefined();
  });

  it('triggers onSaveLocally callback when save button is clicked', () => {
    const handleSave = vi.fn();
    render(
      <DataStoryCanvas
        story={mockStory}
        onPublishToGroup={vi.fn()}
        onSaveLocally={handleSave}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Save Story to Local Folder/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledWith(mockStory);
  });

  it('triggers onPublishToGroup callback when publish button is clicked', () => {
    const handlePublish = vi.fn();
    render(
      <DataStoryCanvas
        story={mockStory}
        onPublishToGroup={handlePublish}
        onSaveLocally={vi.fn()}
      />
    );

    const publishBtn = screen.getByRole('button', { name: /Publish Story to Group/i });
    fireEvent.click(publishBtn);
    expect(handlePublish).toHaveBeenCalledWith(mockStory);
  });
});
