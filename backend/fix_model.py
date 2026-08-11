import sqlite3

conn = sqlite3.connect('pymentor.db')
cur = conn.cursor()
cur.execute("UPDATE user_settings SET model='gemini-3.6-flash'")
conn.commit()
cur.execute("SELECT * FROM user_settings")
print('Updated settings:', cur.fetchall())
conn.close()
print('Done!')
