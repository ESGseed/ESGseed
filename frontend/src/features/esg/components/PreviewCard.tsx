import type { PreviewCard as PreviewCardType } from '@/lib/data/esg';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';

interface PreviewCardProps {
  card: PreviewCardType;
}

export function PreviewCard({ card }: PreviewCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent>
        <CardTitle className="mb-3">{card.title}</CardTitle>
        <div className="text-gray-800 text-sm leading-7">
          {card.content}
        </div>
      </CardContent>
      <CardFooter className={`flex gap-3 items-start ${
        card.commentType === 'info'
          ? 'bg-blue-50 border-blue-100 text-blue-800'
          : 'bg-red-50 border-red-100 text-red-800'
      }`}>
        <div className="font-bold shrink-0 mt-0.5">AI 코멘트:</div>
        <div>{card.aiComment}</div>
      </CardFooter>
    </Card>
  );
}

