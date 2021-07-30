server.get("/user/:id", (req, res)=>{
    res.setHeader("Content-Type", "application/json");
    User.findById(req.params.id, (err, user)=>{
        if (err){
            console.log(`there was an error finding the user`)
            res.status(500).send(
                JSON.stringify({
                    message: `unable to find user with id ${req.params.id}`,
                    error:err,
                })
            );
            return;
        }else if (!user) {
            console.log(`there was an error finding the user`)
            res.status(500).send(
                JSON.stringify({
                    message: `unable to find user with id ${req.params.id}`,
                    error:"This user doesn't exist!",
                })
            );
            return;
        }
        res.status(200).json(user);
    })
});
