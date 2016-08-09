curl \
  -X GET \
  http://localhost:3000

curl \
  -X GET \
  http://localhost:3000/users

curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"password"}' \
  http://localhost:3000/tokens

curl \
  -X PUT \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOiIxMjM0NTYiLCJpc0FjdGl2ZSI6dHJ1ZSwicGVybWlzc2lvbnMiOnsibXktYXBwLW5hbWUiOnsiYWN0aW9ucyI6WyJhY3Rpb24xIiwiYWN0aW9uMiIsImFjdGlvbk4iXX19LCJpYXQiOjE0NjY3MTYyNTIsImV4cCI6MTQ2NzMyMTA1MiwiaXNzIjoibXktaXNzdWVyLW5hbWUiLCJqdGkiOiJTa2dIdnhDWUIifQ.lvZn2pi95i02mYghDIQ9vdqxC2jO0d1i7MCY7r0aqJFfpldNVGwEc2OBGbtFy_LaV8eCTdnOJi21SAD1KBpkbA" \
  http://localhost:3000/refresh

curl \
  -X DELETE \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOiIxMjM0NTYiLCJpc0FjdGl2ZSI6dHJ1ZSwicGVybWlzc2lvbnMiOnsibXktYXBwLW5hbWUiOnsiYWN0aW9ucyI6WyJhY3Rpb24xIiwiYWN0aW9uMiIsImFjdGlvbk4iXX19LCJpYXQiOjE0NjY3MTYyODAsImV4cCI6MTQ2NzMyMTA4MCwiaXNzIjoibXktaXNzdWVyLW5hbWUiLCJqdGkiOiJyMWdsS3hSdHIifQ.QbbZYGUKN1DKwuIjfmHEXCL6k-Rey_N4c_wRrMnRWvDBsNC708aiprO-4ezyfCW-dpfCb4YqaFdLFzPTGI1RYA" \
  http://localhost:3000/revoke

curl \
  -X GET \
  -H "Authorization: Bearer eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NzdiZTI2ZDUwZDNlN2E1NTQ4ODZmNWEiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBlbWFpbC5jb20iLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNBZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOnsiY3JlZC1hdXRoLW1hbmFnZXIiOnsiYWN0aW9ucyI6WyJhZG1pbiJdfX0sImlhdCI6MTQ2NzgzMTEzOSwiZXhwIjoxNDY3OTE3NTM5LCJpc3MiOiJjcmVkLWF1dGgtbWFuYWdlciIsImp0aSI6InJ5aVBRQWNJIn0.uTRIqjS7IUNOyEQ_OaDF7GSOno_O7ijSz6ZGxfzF505fSDVaaQ-A489PZZd4Q6GiPEQ1jsqt_qooczzli8OllFus_ONqSDURL6bq8a_8VA2GaFmXC58azUA68Om6Whc8" \
  http://localhost:3000/users
