import Card from "./Card";

type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card className="min-h-44">
      <h3 className="text-heading text-xl font-bold text-[var(--color-text)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        {description}
      </p>
    </Card>
  );
}
