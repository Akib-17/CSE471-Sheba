"""add provider_unique_id and complaint warning tables

Revision ID: b1c2d3e4f5g6
Revises: f40ae472987b
Create Date: 2025-12-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5g6'
down_revision = 'add_email_notif'
branch_labels = None
depends_on = None


def upgrade():
    # Check if provider_unique_id column already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('user')]

    if 'provider_unique_id' not in columns:
        # Add provider_unique_id column to user table
        with op.batch_alter_table('user', schema=None) as batch_op:
            batch_op.add_column(sa.Column('provider_unique_id', sa.String(length=50), nullable=True))


def downgrade():
    # Check if provider_unique_id column exists before dropping
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('user')]

    if 'provider_unique_id' in columns:
        # Remove provider_unique_id column from user table
        with op.batch_alter_table('user', schema=None) as batch_op:
            batch_op.drop_column('provider_unique_id')
