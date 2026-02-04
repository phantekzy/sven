const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* information */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div
              className="w-12 rounded-full bg-base-300"
              dangerouslySetInnerHTML={{ __html: friend.profilePic }}
            />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
