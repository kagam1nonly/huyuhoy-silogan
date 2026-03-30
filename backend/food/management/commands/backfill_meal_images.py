import re
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from food.models import Meal


def normalize_key(value):
    return re.sub(r'[^a-z0-9]+', '', (value or '').lower())


def base_stem_without_suffix(stem):
    # Handles Django-renamed files like tocinosilog_qtcaeBq
    if '_' in stem:
        return stem.rsplit('_', 1)[0]
    return stem


class Command(BaseCommand):
    help = 'One-time backfill of Meal.pImage from local media files (useful after migrating to Cloudinary).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--media-dir',
            type=str,
            default=str(Path(settings.BASE_DIR) / 'media' / 'meal_images'),
            help='Directory containing source meal images.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview mappings without uploading/saving.',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Overwrite images even when they already point to Cloudinary.',
        )

    def handle(self, *args, **options):
        media_dir = Path(options['media_dir'])
        dry_run = options['dry_run']
        force = options['force']

        if not media_dir.exists() or not media_dir.is_dir():
            self.stderr.write(self.style.ERROR(f'Media directory not found: {media_dir}'))
            return

        image_files = [
            p for p in media_dir.iterdir()
            if p.is_file() and p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}
        ]
        if not image_files:
            self.stderr.write(self.style.ERROR(f'No image files found in: {media_dir}'))
            return

        by_name = {}
        for path in image_files:
            stem = path.stem
            keys = {
                normalize_key(stem),
                normalize_key(base_stem_without_suffix(stem)),
            }
            for key in keys:
                if key:
                    by_name.setdefault(key, path)

        total = 0
        updated = 0
        skipped = 0
        unresolved = 0

        meals = Meal.objects.all().order_by('meal_id')
        for meal in meals:
            total += 1
            meal_key = normalize_key(meal.name)
            candidate = by_name.get(meal_key)

            if candidate is None and meal.pImage:
                current_name = Path(str(meal.pImage.name)).stem
                candidate = by_name.get(normalize_key(current_name)) or by_name.get(
                    normalize_key(base_stem_without_suffix(current_name))
                )

            if candidate is None:
                unresolved += 1
                self.stdout.write(self.style.WARNING(f'No image match for meal {meal.meal_id}: {meal.name}'))
                continue

            existing_url = ''
            if meal.pImage:
                try:
                    existing_url = meal.pImage.url
                except Exception:
                    existing_url = ''

            if existing_url and 'res.cloudinary.com' in existing_url and not force:
                skipped += 1
                self.stdout.write(f'Skip meal {meal.meal_id} ({meal.name}): already in Cloudinary')
                continue

            action_msg = f'Map meal {meal.meal_id} ({meal.name}) -> {candidate.name}'
            if dry_run:
                self.stdout.write(f'[DRY RUN] {action_msg}')
                continue

            with candidate.open('rb') as image_fp:
                meal.pImage.save(candidate.name, File(image_fp), save=True)

            updated += 1
            self.stdout.write(self.style.SUCCESS(action_msg))

        summary = (
            f'Backfill complete. total={total}, updated={updated}, '
            f'skipped={skipped}, unresolved={unresolved}, dry_run={dry_run}'
        )
        self.stdout.write(self.style.SUCCESS(summary))
