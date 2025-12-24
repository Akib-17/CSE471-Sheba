from app import create_app, db, socketio
from flask.cli import FlaskGroup
from flask_migrate import Migrate
import sys

app = create_app()
migrate = Migrate(app, db)
cli = FlaskGroup(create_app=lambda: app)

@cli.command()
def run():
    """Run the application with SocketIO support"""
    import os
    port = int(os.environ.get('FLASK_RUN_PORT', 1588))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)

if __name__ == '__main__':
    # If 'run' command is provided, use socketio.run, otherwise use Flask CLI
    if len(sys.argv) > 1 and sys.argv[1] == 'run':
        import os
        port = int(os.environ.get('FLASK_RUN_PORT', 1588))
        socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
    else:
        cli()
