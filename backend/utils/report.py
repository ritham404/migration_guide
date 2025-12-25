class MigrationReport:
    def __init__(self):
        self.entries = []

    def add(self, file, status):
        self.entries.append((file, status))

    def render(self):
        lines = ["AZURE -> GCP MIGRATION REPORT", "=" * 30]
        for f, s in self.entries:
            lines.append(f"{f}: {s}")
        return "\n".join(lines)
