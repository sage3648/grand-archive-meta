import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Database, Zap, Shield } from 'lucide-react';

export const metadata = {
  title: 'About | Grand Archive Meta',
  description: 'Learn about the Grand Archive Meta analysis platform',
};

export default function AboutPage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Meta Analysis',
      description: 'Track champion performance, win rates, and popularity across all competitive formats.',
    },
    {
      icon: Database,
      title: 'Tournament Data',
      description: 'Access comprehensive tournament results and decklists from events worldwide.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay current with the latest meta trends and tournament results as they happen.',
    },
    {
      icon: Shield,
      title: 'Reliable Data',
      description: 'All data sourced from verified tournament results and official events.',
    },
  ];

  const techStack = [
    { name: 'Next.js 15', category: 'Framework' },
    { name: 'React 19', category: 'UI Library' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'shadcn/ui', category: 'Components' },
    { name: 'Recharts', category: 'Charts' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About Grand Archive Meta</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive platform for tracking and analyzing the competitive Grand Archive TCG meta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
          <CardDescription>Empowering the Grand Archive community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Grand Archive Meta was created to provide players with the tools and insights they need
            to understand and compete in the ever-evolving Grand Archive competitive landscape.
          </p>
          <p>
            We aggregate tournament data from events around the world, analyze performance metrics,
            and present the information in an accessible, easy-to-understand format. Whether you&apos;re
            preparing for your next tournament or simply curious about the current meta, our platform
            has the data you need.
          </p>
          <p>
            All data is sourced from official tournament results and verified event reports,
            ensuring accuracy and reliability for competitive players.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
          <CardDescription>Built with modern web technologies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech.name} variant="secondary">
                {tech.name}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This platform is built with cutting-edge web technologies to provide a fast, responsive,
            and reliable user experience across all devices.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Where our data comes from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Tournament Results</h4>
            <p className="text-sm text-muted-foreground">
              We collect data from premier events, regional championships, local tournaments, and
              online competitions to provide comprehensive meta analysis.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Decklist Submissions</h4>
            <p className="text-sm text-muted-foreground">
              Tournament organizers and players submit decklists from top-performing decks,
              which we verify and add to our database.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Card Database</h4>
            <p className="text-sm text-muted-foreground">
              Card information is sourced from the official Grand Archive card database and
              updated regularly with new releases.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contributing</CardTitle>
          <CardDescription>Help improve the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We welcome contributions from the community! Whether you&apos;re a tournament organizer
            with results to submit, a developer interested in contributing code, or a player
            with feedback on the platform, we&apos;d love to hear from you.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold">Ways to contribute:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Submit tournament results and decklists</li>
              <li>Report bugs or suggest features</li>
              <li>Contribute code improvements</li>
              <li>Share the platform with other players</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-8">
        <p>
          Grand Archive Meta is a community project and is not affiliated with or endorsed by
          the official Grand Archive TCG.
        </p>
        <p className="mt-2">
          Built with passion for the Grand Archive community.
        </p>
      </div>
    </div>
  );
}
