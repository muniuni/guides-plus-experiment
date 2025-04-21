class Score < ApplicationRecord
  belongs_to :image
  serialize :x_values, Array
  serialize :y_values, Array
end
