<!-- Technical Depts -->
# TODO:

## 1. Registration:
    - Trader Registration: The user should not be allowed to navigate to the screen if they provide a surname with that contains spaces.
    - Double-check all the possible data input errors a user may make and implement the system behavior accordinglt.

## 2. PowerSync:
    - If the app is closed and the user wants to open it while offline, they should not be required to reconnect to the internet, unless the user session has expired.
    



<!------------------------------------------------------------>
# 1. Database schemas:
- **Optimize addresses by pre-filling provinces, districts, admin_posts, and villages**: theses tables (provinces, districts, admin_posts, and villages) must be pre-filled, and any other table needing one of the must reference their ids.
- **Optimize documents and licences tables**: there should be a clear normalization as NUIT and actors identification document may be relevants in the future (scalability)

# 2. Handle the shipment path management"
- **In case of the marchandises being rejected at the destination**: the user can define new destination to the marchandises by chosing the province and district of destination, and the reason which for chosing this new destination. For every check, there is note property (to be used for informing whether the marchandises movement is "going" or "returning")
