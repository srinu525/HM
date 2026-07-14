import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}