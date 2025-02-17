export function Footer() {
  return (
    <footer className="bg-muted py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Created with ❤️ by{" "}
            <span className="font-semibold">Yash Kashyap</span> and{" "}
            <span className="font-semibold">Atul Kumar Kanojia</span>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mental Health Assessment Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
