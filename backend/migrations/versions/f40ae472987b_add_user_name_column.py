"""add user.name column

Revision ID: f40ae472987b
Revises: a0c85846e5d3
Create Date: 2025-12-05 23:17:47.989952

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f40ae472987b'
down_revision = 'a0c85846e5d3'
branch_labels = None
depends_on = None


def upgrade():
    # Add name column to user table
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=200), nullable=True))


def downgrade():
    # Remove name column from user table
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('name')
