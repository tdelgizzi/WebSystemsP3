"""REST API for likes."""
import flask
import insta485
from insta485.api.exception import InvalidUsage


@insta485.app.route('/api/v1/p/<int:postid_url_slug>/likes/', methods=["GET"])
def get_likes(postid_url_slug):
    """Return number of likes for a post."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    logname = flask.session['user']
    # If post does not exist, 404 error
    connection = insta485.model.get_db()
    postid = postid_url_slug
    con_val = connection.execute(
        "select  COUNT(*) FROM posts "
        "where postid = ?", (postid, )
    )
    if not con_val.fetchall()[0]["COUNT(*)"]:
        raise InvalidUsage("Not Found", 404)
    cur = connection.execute(
        "select owner from likes "
        "where postid = ?", (postid_url_slug, )
    )
    logname_likes = 0
    count = 0
    for liker in cur.fetchall():
        count += 1
        if liker['owner'] == logname:
            logname_likes = 1
    context = {
        "logname_likes_this": logname_likes,
        "likes_count": count,
        "postid": postid_url_slug,
        "url": flask.request.path,
    }
    return flask.jsonify(**context)


@insta485.app.route('/api/v1/p/<int:postid>/likes/', methods=["DELETE"])
def delete_like(postid):
    """Delete a like for post <postid>."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    user = flask.session['user']
    connection = insta485.model.get_db()
    connection.execute(
        "DELETE from likes "
        "where postid = ? AND owner = ?", (postid, user)
    )
    context = {}
    return flask.jsonify(**context), 204


@insta485.app.route('/api/v1/p/<int:postid_url_slug>/likes/', methods=["POST"])
def post_like(postid_url_slug):
    """Create a like for post <postid>."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    user = flask.session['user']
    # Check if like already exists for user
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT COUNT(*) FROM likes "
        "where postid = ? AND owner = ?", (postid_url_slug, user)
    )
    if cur.fetchall()[0]['COUNT(*)']:
        raise InvalidUsage("Conflict", 409,
                           {"logname": user, "postid": postid_url_slug})

    cur = connection.execute(
        "INSERT INTO likes(owner, postid) "
        "VALUES(?, ?)", (user, postid_url_slug)
    )
    context = {"logname": user, "postid": postid_url_slug}
    return flask.jsonify(**context), 201
