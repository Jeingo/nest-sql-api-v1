export const errorsMessageForIncorrectBlog = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'name'
    },
    {
      message: 'should not be empty',
      field: 'description'
    },
    {
      message: 'should not be empty',
      field: 'websiteUrl'
    }
  ]
};

export const errorsMessageForIncorrectPost = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'title'
    },
    {
      message: 'should not be empty',
      field: 'shortDescription'
    },
    {
      message: 'should not be empty',
      field: 'content'
    }
  ]
};

export const errorsMessageForIncorrectPostWithBlogId = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'title'
    },
    {
      message: 'should not be empty',
      field: 'shortDescription'
    },
    {
      message: 'should not be empty',
      field: 'content'
    }
  ]
};

export const errorsMessageForIncorrectComment = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'content'
    }
  ]
};

export const errorsMessageForIncorrectPostLike = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'likeStatus'
    }
  ]
};

export const errorsMessageForIncorrectCommentLike = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'likeStatus'
    }
  ]
};

export const errorsMessageForIncorrectUser = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'login'
    },
    {
      message: 'should not be empty',
      field: 'password'
    },
    {
      message: 'should not be empty',
      field: 'email'
    }
  ]
};

export const errorsMessageForIncorrectLogin = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'loginOrEmail'
    },
    {
      message: 'should not be empty',
      field: 'password'
    }
  ]
};

export const errorsMessageForRegistration = {
  errorsMessages: [
    {
      message: 'is already exist',
      field: 'login'
    },
    {
      message: 'is already exist',
      field: 'email'
    }
  ]
};

export const errorsMessageForConfirmation = {
  errorsMessages: [
    {
      message: 'code is wrong',
      field: 'code'
    }
  ]
};

export const errorsMessageForEmailResending = {
  errorsMessages: [
    {
      message: 'email is wrong',
      field: 'email'
    }
  ]
};

export const errorsMessageForPasswordRecovery = {
  errorsMessages: [
    {
      message: 'must be an email',
      field: 'email'
    }
  ]
};

export const errorsMessageForNewPassword = {
  errorsMessages: [
    {
      message: 'must be longer than or equal to 6 characters',
      field: 'newPassword'
    },
    {
      message: 'should not be empty',
      field: 'recoveryCode'
    }
  ]
};

export const errorsMessageForBadBan = {
  errorsMessages: [
    {
      message: 'must be longer than or equal to 20 characters',
      field: 'banReason'
    }
  ]
};

export const errorsMessageForBloggerBanUser = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'banReason'
    },
    {
      message: 'should not be empty',
      field: 'blogId'
    }
  ]
};

export const errorsMessageForBanBlog = {
  errorsMessages: [
    {
      message: 'should not be empty',
      field: 'isBanned'
    }
  ]
};
