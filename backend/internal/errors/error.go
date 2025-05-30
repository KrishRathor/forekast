package CustomErrors 

import "errors"

var (
  ErrInvalidJson = errors.New("invalid json")
  ErrWrite = errors.New("cannot write")
  ErrInvalidType = errors.New("invlaid type")
)
