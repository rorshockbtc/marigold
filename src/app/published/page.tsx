import { Metadata } from 'next';
import { getPublishedStory } from '@/lib/firebase/firestore';
import PublishedStoryClient from './PublishedStoryClient';

type Props = {
  searchParams: { id?: string }
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = searchParams.id;
  
  if (!id) {
    return {
      title: 'Marigold Data Stories',
      description: 'View interactive, AI-driven data analysis.',
    };
  }

  // Fetch the story on the server to populate Open Graph tags for iMessage/Twitter/Slack
  const story = await getPublishedStory(id);

  if (!story) {
    return {
      title: 'Story Not Found | Marigold',
      description: 'The requested Data Story could not be found.',
    };
  }

  // Generate a brief excerpt from the first block
  let description = 'View interactive, AI-driven data analysis.';
  if (story.blocks && story.blocks.length > 0) {
    const firstTextBlock = story.blocks.find(b => b.type === 'narrative');
    if (firstTextBlock && firstTextBlock.content) {
      // Clean HTML tags and truncate
      const cleanContent = firstTextBlock.content.replace(/<[^>]*>?/gm, '');
      description = cleanContent.substring(0, 150) + '...';
    }
  }

  return {
    title: story.title || 'Marigold Data Story',
    description,
    openGraph: {
      title: story.title || 'Marigold Data Story',
      description,
      type: 'article',
      siteName: 'Marigold Insights',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title || 'Marigold Data Story',
      description,
    },
  };
}

export default function PublishedStoryPage() {
  return <PublishedStoryClient />;
}
