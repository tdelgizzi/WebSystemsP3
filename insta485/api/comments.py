"""REST API for retrieving data on comments."""
import flask
from flask import request
import insta485
from insta485.api.exception import InvalidUsage


@insta485.app.route('/api/v1/p/<int:postid>/comments/', methods=["GET"])
def get_comments(postid):
    """Return list of comments for a post."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    connect = insta485.model.get_db()
    # Query database
    # If post does not exist, 404 error
    cur = connect.execute(
        "select  COUNT(*) FROM posts "
        "where postid = ?", (postid, )
    )
    if not cur.fetchall()[0]["COUNT(*)"]:
        raise InvalidUsage("Not Found", 404)
    cur = connect.execute(
        "select  c.owner as owner, c.commentid as commentid, "
        "c.text as text "
        "from comments c "
        "join users u on c.owner = u.username "
        "where postid = ?", (postid, )
    )
    post_query = cur.fetchall()
    comments = []
    for comment in post_query:
        owner_url = flask.url_for('show_user', user_url_slug=comment["owner"])
        comments.append({"commentid": comment['commentid'],
                         "owner": comment['owner'],
                         "owner_show_url": owner_url,
                         "postid": postid,
                         "text": comment["text"]})
    context = {
        "comments": comments,
        "url": flask.request.path
    }
    return flask.jsonify(**context)


@insta485.app.route('/api/v1/p/<int:postid>/comments/', methods=["POST"])
def post_comments(postid):
    """Add a comment to a post."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    user = flask.session['user']
    connection = insta485.model.get_db()
    text = request.json['text']
    cur = connection.execute(
        "INSERT INTO comments(owner, postid, text) "
        "VALUES (?, ?, ?) ", (user, postid, text)
    )
    # Get commentid
    cur = connection.execute(
        "select last_insert_rowid() as commentid"
    )
    commentid = cur.fetchall()[0]['commentid']
    context = {
        "commentid": commentid,
        "owner": user,
        "owner_show_url": flask.url_for("show_user", user_url_slug=user),
        "postid": postid,
        "text": text
    }
    return flask.jsonify(**context), 201
