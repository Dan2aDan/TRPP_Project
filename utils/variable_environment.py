import os
class VarEnv:
    DBUSER = os.environ.get("DBUSER")
    DBPASSWORD = os.environ.get("DBPASSWORD")
    DBHOST = os.environ.get("DBHOST")
    DBNAME = os.environ.get("DBNAME")
    SECRET_KEY = os.environ.get("SECRET_KEY")