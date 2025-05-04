import os
import sqlalchemy
from sqlalchemy import delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Files
import logging
from datetime import date

base_dir = "src"


class DatabaseFiles:
    def __init__(self, db):
        self.db = db
        # Ensure src directory exists
        os.makedirs(base_dir, exist_ok=True)

    def create_file(self, filename, file_content):
        """Create a new file in the src directory and store its metadata in the database."""

        # Generate file path
        file_path = os.path.join(base_dir, filename)

        # Save file to src directory
        with open(file_path, 'wb') as f:
            f.write(file_content)

        # Generate a relative URL (placeholder; adjust based on app hosting)
        file_url = f"/{base_dir}/{filename}"

        # Store file metadata in database
        with self.db.create_session() as session:
            file_record = Files(
                path=file_path,
                uploaded_at=date.today()
            )
            session.add(file_record)
            session.commit()
            session.refresh(file_record)
            return file_record

    def delete_file(self, file_id):
        """Delete a file by ID from both the database and the src directory."""
        with self.db.create_session() as session:
            try:
                # Retrieve file metadata
                file_record = session.get(Files, file_id)
                if not file_record:
                    return False

                # Delete file from filesystem
                if os.path.exists(file_record.path):
                    os.remove(file_record.path)

                # Delete file metadata from database
                session.execute(delete(Files).where(Files.id == file_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting file: {e}")
                return False

    def get_file_by_id(self, file_id):
        """Retrieve file metadata by ID from the database."""
        query = sqlalchemy.select(Files).where(Files.id == file_id)
        return self.db.select(query, types=self.db.any_)


db_files = DatabaseFiles(db)
